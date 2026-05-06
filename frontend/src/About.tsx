import { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import readmeContent from './README.md?raw';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('');
  
  // Use a stable random ID that doesn't change on re-renders
  const [id] = useState(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    let isMounted = true;
    
    // Mermaid render can sometimes throw if the chart is malformed
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) setSvg(svg);
      } catch (error) {
        console.error("Mermaid parsing error:", error);
      }
    };
    
    renderChart();

    return () => { isMounted = false; };
  }, [chart, id]);

  if (!svg) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, bgcolor: '#f5f5f5', borderRadius: 2, my: 2 }}>
        <Typography color="text.secondary">Rendering chart...</Typography>
      </Box>
    );
  }

  return (
    <Box 
      dangerouslySetInnerHTML={{ __html: svg }} 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        my: 4, 
        p: 2,
        bgcolor: '#ffffff',
        borderRadius: 2,
        border: '1px solid #eaeaea',
        '& svg': { maxWidth: '100%', height: 'auto', display: 'block' } 
      }} 
    />
  );
}

export default function About() {
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6, flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          About Project
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<GitHubIcon />}
          href="https://github.com/dumidulkdev/Hadahana"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </Button>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          border: '1px solid #eaeaea', 
          backgroundColor: '#fafafa',
          '& img': { maxWidth: '100%', height: 'auto' },
          '& pre': { backgroundColor: '#1e1e1e', color: '#fff', p: 2, borderRadius: 2, overflowX: 'auto' },
          '& code': { fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '4px' },
          '& pre code': { backgroundColor: 'transparent', padding: 0 }
        }}
      >
        <ReactMarkdown
          components={{
            code(props) {
              const { children, className, node, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              
              if (match && match[1] === 'mermaid') {
                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
              }
              
              return (
                <code {...rest} className={className}>
                  {children}
                </code>
              );
            }
          }}
        >
          {readmeContent}
        </ReactMarkdown>
      </Paper>
    </Container>
  );
}
