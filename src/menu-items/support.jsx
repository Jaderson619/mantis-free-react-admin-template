// assets
import { ChromeOutlined, QuestionOutlined, SettingOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  SettingOutlined
};

// ==============================|| MENU ITEMS - SUPORTE & CONFIGURAÇÕES ||============================== //

const support = {
  id: 'support',
  title: 'Suporte',
  type: 'group',
  children: [
    {
      id: 'sample-page',
      title: 'Página Exemplo',
      type: 'item',
      url: '/sample-page',
      icon: icons.ChromeOutlined
    },
    {
      id: 'theme-settings',
      title: 'Configurações de Tema',
      type: 'item',
      url: '/settings/theme',
      icon: icons.SettingOutlined
    },
    {
      id: 'help',
      title: 'Ajuda',
      type: 'item',
      url: '#',
      icon: icons.QuestionOutlined,
      external: false
    }
  ]
};

export default support;
