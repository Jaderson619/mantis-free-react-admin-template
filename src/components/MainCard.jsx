import PropTypes from 'prop-types';
import { forwardRef } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

// header style
const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

function MainCard(
  {
    border = true,
    boxShadow = false,
    children,
    content = true,
    contentSX = {},
    darkTitle,
    elevation,
    secondary,
    sx = {},
    title,
    ...others
  },
  ref
) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      elevation={elevation !== undefined ? elevation : (boxShadow ? 2 : 0)}
      ref={ref}
      {...others}
      sx={{
        border: border ? '1px solid' : 'none',
        borderRadius: 3,
        borderColor: isDark ? theme.palette.divider : theme.palette.grey[300],
        boxShadow: boxShadow ? theme.shadows[2] : 'none',
        ':hover': {
          boxShadow: boxShadow ? theme.shadows[4] : 'none'
        },
        '& pre': {
          m: 0,
          p: '16px !important',
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem'
        },
        ...sx
      }}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader 
          sx={headerSX} 
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} 
          title={title} 
          action={secondary} 
        />
      )}
      {darkTitle && title && (
        <CardHeader 
          sx={headerSX} 
          title={<Typography variant="h5" fontWeight={600}>{title}</Typography>} 
          action={secondary} 
        />
      )}

      {/* card content */}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}
    </Card>
  );
}

export default forwardRef(MainCard);

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.node,
  subheader: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.bool,
  contentSX: PropTypes.object,
  darkTitle: PropTypes.bool,
  divider: PropTypes.bool,
  elevation: PropTypes.number,
  secondary: PropTypes.any,
  shadow: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  modal: PropTypes.bool,
  others: PropTypes.any
};
