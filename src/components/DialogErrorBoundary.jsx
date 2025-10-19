import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

class DialogErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dialog Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Erro no Dialog</Typography>
            <Typography variant="body2">
              Ocorreu um erro ao atualizar a interface. Por favor, feche e tente novamente.
            </Typography>
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) {
                this.props.onReset();
              }
            }}
          >
            Tentar Novamente
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default DialogErrorBoundary;
