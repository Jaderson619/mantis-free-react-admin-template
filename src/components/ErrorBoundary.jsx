import React from 'react';
import { Box, Button, Paper, Typography, Stack } from '@mui/material';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Atualizar state para que a próxima renderização mostre a UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Você pode registrar o erro em um serviço de relatório de erros
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback customizada
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Stack spacing={3} alignItems="center">
              <WarningOutlined style={{ fontSize: 64, color: '#ff6b6b' }} />
              
              <Typography variant="h4" fontWeight="bold">
                Ops! Algo deu errado
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                Desculpe, ocorreu um erro inesperado no aplicativo.
                Tente recarregar a página ou voltar para a página inicial.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box 
                  sx={{ 
                    width: '100%',
                    p: 2, 
                    bgcolor: 'error.lighter',
                    borderRadius: 1,
                    textAlign: 'left',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" color="error.main">
                    Detalhes do erro (apenas em desenvolvimento):
                  </Typography>
                  <Typography 
                    variant="caption" 
                    component="pre" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.75rem',
                      mt: 1
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Box>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<ReloadOutlined />}
                  onClick={this.handleReload}
                >
                  Recarregar Página
                </Button>
                <Button
                  variant="outlined"
                  onClick={this.handleGoHome}
                >
                  Ir para Início
                </Button>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                Se o problema persistir, entre em contato com o suporte.
              </Typography>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
