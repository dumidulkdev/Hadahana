from datetime import datetime

import pytz
import swisseph as swe
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Astrology Calculation Engine")


class BirthPlace(BaseModel):
    latitude: float
    longitude: float


class HoroscopeRequest(BaseModel):
    dateOfBirth: str
    timeOfBirth: str
    gender: str
    birth_place: BirthPlace


RASHIS = [
    "මේෂ",
    "වෘෂභ",
    "මිථුන",
    "කටක",
    "සිංහ",
    "කන්‍යා",
    "තුලා",
    "වෘශ්චික",
    "ධනු",
    "මකර",
    "කුම්භ",
    "මීන",
]
PLANETS = {
    swe.SUN: "රවි",
    swe.MOON: "සඳු",
    swe.MARS: "කුජ",
    swe.MERCURY: "බුධ",
    swe.JUPITER: "ගුරු",
    swe.VENUS: "සිකුරු",
    swe.SATURN: "ශනි",
    swe.MEAN_NODE: "රාහු",
}
DASHA_LORDS = [
    ("කේතු", 7),
    ("සිකුරු", 20),
    ("රවි", 6),
    ("සඳු", 10),
    ("කුජ", 7),
    ("රාහු", 18),
    ("ගුරු", 16),
    ("ශනි", 19),
    ("බුධ", 17),
]


def get_house(lagna_index, planet_rashi_index):
    return ((planet_rashi_index - lagna_index) % 12) + 1


def get_navamsha(degree):
    navamsha_index = int((degree * 3) / 10) % 12
    return RASHIS[navamsha_index]


def calculate_current_dasha(
    nakshatra_index, passed_percentage, birth_utc_dt, current_utc_dt
):
    days_passed = (current_utc_dt - birth_utc_dt).days
    years_passed = days_passed / 365.25

    dasha_index = nakshatra_index % 9
    dasha_lord, total_years = DASHA_LORDS[dasha_index]
    balance_years = total_years * (1 - passed_percentage)

    if years_passed < balance_years:
        current_md_index = dasha_index
        years_into_md = years_passed + (total_years * passed_percentage)
    else:
        years_passed -= balance_years
        current_md_index = (dasha_index + 1) % 9
        while True:
            lord, duration = DASHA_LORDS[current_md_index]
            if years_passed < duration:
                years_into_md = years_passed
                break
            years_passed -= duration
            current_md_index = (current_md_index + 1) % 9

    md_lord, md_duration = DASHA_LORDS[current_md_index]

    ad_index = current_md_index
    passed_in_md = years_into_md
    ad_lord = ""
    for i in range(9):
        lord, ad_lord_duration = DASHA_LORDS[ad_index]
        ad_duration = (md_duration * ad_lord_duration) / 120.0
        if passed_in_md < ad_duration:
            ad_lord = lord
            break
        passed_in_md -= ad_duration
        ad_index = (ad_index + 1) % 9

    return md_lord, ad_lord


@app.post("/api/analsye")
async def calculate_horoscope(data: HoroscopeRequest):
    try:
        sl_tz = pytz.timezone("Asia/Colombo")
        dt_str = f"{data.dateOfBirth} {data.timeOfBirth}"
        local_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        local_dt = sl_tz.localize(local_dt)
        birth_utc = local_dt.astimezone(pytz.utc)

        swe.set_sid_mode(swe.SIDM_LAHIRI)
        jd_birth = swe.julday(
            birth_utc.year,
            birth_utc.month,
            birth_utc.day,
            birth_utc.hour + (birth_utc.minute / 60.0),
        )

        lat = data.birth_place.latitude
        lon = data.birth_place.longitude

        cusps, ascmc = swe.houses_ex(jd_birth, lat, lon, b"P", flags=swe.FLG_SIDEREAL)
        asc_deg = ascmc[0]
        lagna_idx = int(asc_deg / 30.0)

        chart_data = {}

        sun_pos, _ = swe.calc_ut(
            jd_birth, swe.SUN, flags=swe.FLG_SIDEREAL | swe.FLG_SPEED
        )
        sun_lon = sun_pos[0]
        chart_data["රවි"] = {
            "planet": "රවි",
            "rashi": RASHIS[int(sun_lon / 30.0)],
            "house": get_house(lagna_idx, int(sun_lon / 30.0)),
            "is_retrograde": False,
            "is_combust": False,
        }

        for p_id, p_name in PLANETS.items():
            if p_id == swe.SUN:
                continue

            pos, _ = swe.calc_ut(jd_birth, p_id, flags=swe.FLG_SIDEREAL | swe.FLG_SPEED)
            lon, speed = pos[0], pos[3]
            rashi_idx = int(lon / 30.0)

            is_retrograde = True if speed < 0 else False
            is_combust = False

            if p_id not in [swe.MOON, swe.MEAN_NODE]:
                diff = abs(lon - sun_lon)
                if diff > 180:
                    diff = 360 - diff
                if diff <= 10:
                    is_combust = True

            chart_data[p_name] = {
                "planet": p_name,
                "rashi": RASHIS[rashi_idx],
                "house": get_house(lagna_idx, rashi_idx),
                "is_retrograde": is_retrograde,
                "is_combust": is_combust,
            }

        rahu_lon = (
            chart_data["රාහු"]["longitude"]
            if "longitude" in chart_data["රාහු"]
            else swe.calc_ut(jd_birth, swe.MEAN_NODE, flags=swe.FLG_SIDEREAL)[0][0]
        )
        ketu_lon = (rahu_lon + 180) % 360
        ketu_rashi_idx = int(ketu_lon / 30.0)
        chart_data["කේතු"] = {
            "planet": "කේතු",
            "rashi": RASHIS[ketu_rashi_idx],
            "house": get_house(lagna_idx, ketu_rashi_idx),
            "is_retrograde": True,
            "is_combust": False,
        }

        moon_lon = swe.calc_ut(jd_birth, swe.MOON, flags=swe.FLG_SIDEREAL)[0][0]
        nakshatra_len = 360 / 27.0
        nak_idx = int(moon_lon / nakshatra_len)
        paadaya = int((moon_lon % nakshatra_len) / (nakshatra_len / 4.0)) + 1
        passed_pct = (moon_lon % nakshatra_len) / nakshatra_len

        current_utc = datetime.utcnow()
        md_lord, ad_lord = calculate_current_dasha(
            nak_idx, passed_pct, birth_utc.replace(tzinfo=None), current_utc
        )

        jd_now = swe.julday(
            current_utc.year,
            current_utc.month,
            current_utc.day,
            current_utc.hour + (current_utc.minute / 60.0),
        )
        transits = {}
        for p_id in [swe.SATURN, swe.JUPITER]:
            pos, _ = swe.calc_ut(jd_now, p_id, flags=swe.FLG_SIDEREAL)
            rashi_idx = int(pos[0] / 30.0)
            transits[f"{PLANETS[p_id]}_house"] = get_house(lagna_idx, rashi_idx)

        return {
            "birth_details": {
                "gender": data.gender,
                "lagnaya": RASHIS[lagna_idx],
                "navamsha_lagnaya": get_navamsha(asc_deg),
                "moon_sign": chart_data["සඳු"]["rashi"],
                "nakshatra_id": nak_idx + 1,
                "paadaya": paadaya,
            },
            "current_running_dasha": {"mahadasha": md_lord, "antardasha": ad_lord},
            "planetary_positions": chart_data,
            "current_transits": transits,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
