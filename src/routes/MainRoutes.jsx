import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import ErrorBoundary from 'components/ErrorBoundary';

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
const ProductCreate = Loadable(lazy(() => import('pages/products/create')));
const ProductsList = Loadable(lazy(() => import('pages/products/list')));

// render - sample page
const OrdersPage = Loadable(lazy(() => import('pages/orders/index')));
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <Dashboard />,
  errorElement: (
    <ErrorBoundary>
      <div style={{ padding: 20 }}>
        <h2>Erro ao carregar a página</h2>
        <p>Tente recarregar ou voltar à página inicial.</p>
      </div>
    </ErrorBoundary>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'pedidos',
      element: <ErrorBoundary><OrdersPage /></ErrorBoundary>
    },
    {
      path: 'produtos',
      element: <ErrorBoundary><ProductsList /></ErrorBoundary>
    },
    {
      path: 'produtos/novo',
      element: <ErrorBoundary><ProductCreate /></ErrorBoundary>
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'typography',
      element: <Typography />
    }
  ]
};

export default MainRoutes;
