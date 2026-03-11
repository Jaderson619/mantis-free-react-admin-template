// assets
import { DashboardOutlined, CalculatorOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  CalculatorOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'pedidos',
      title: 'Pedidos',
      type: 'item',
      url: '/pedidos',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'produtos',
      title: 'Produtos',
      type: 'item',
      url: '/produtos',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'precificacao',
      title: 'Precificador E-commerce',
      type: 'item',
      url: '/produtos/precificacao',
      icon: icons.CalculatorOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
