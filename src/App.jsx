import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import CustomThemeProvider from 'theme/ThemeProvider';
import ScrollTop from 'components/ScrollTop';

// ==============================|| APP - THEME, ROUTER ||============================== //

export default function App() {
  return (
    <CustomThemeProvider>
      <ScrollTop>
        <RouterProvider router={router} />
      </ScrollTop>
    </CustomThemeProvider>
  );
}
