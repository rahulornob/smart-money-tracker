import React from 'react';
import {
  IconShoppingCart,
  IconToolsKitchen2,
  IconHome,
  IconCar,
  IconShoppingBag,
  IconMovie,
  IconBolt,
  IconActivityHeartbeat,
  IconPlane,
  IconBook,
  IconRepeat,
  IconDots,
  IconBriefcase,
  IconDeviceLaptop,
  IconTrendingUp,
  IconGift,
  IconCirclePlus,
  IconBuildingBank,
  IconWallet,
  IconPigMoney,
  IconCreditCard,
  IconChartLine,
  IconHelpCircle,
  IconShieldCheck,
  IconCoins,
  IconStack2,
} from '@tabler/icons-react';

const TABLER_ICON_MAP = {
  // Expense Categories
  ShoppingCart: IconShoppingCart,
  Utensils: IconToolsKitchen2,
  Home: IconHome,
  Car: IconCar,
  ShoppingBag: IconShoppingBag,
  Film: IconMovie,
  Zap: IconBolt,
  HeartPulse: IconActivityHeartbeat,
  Heart: IconActivityHeartbeat,
  Plane: IconPlane,
  BookOpen: IconBook,
  Repeat: IconRepeat,
  MoreHorizontal: IconDots,

  // Income Categories
  Salary: IconBriefcase,
  Briefcase: IconBriefcase,
  Freelance: IconDeviceLaptop,
  Laptop: IconDeviceLaptop,
  Investments: IconTrendingUp,
  TrendingUp: IconTrendingUp,
  Gift: IconGift,
  PlusCircle: IconCirclePlus,

  // Account Types & Custom
  Building2: IconBuildingBank,
  Building: IconBuildingBank,
  Wallet: IconWallet,
  PiggyBank: IconPigMoney,
  CreditCard: IconCreditCard,
  LineChart: IconChartLine,
  ShieldCheck: IconShieldCheck,
  Coins: IconCoins,
  Layers: IconStack2,
};

export default function CategoryIcon({
  iconName,
  size = 20,
  color = 'currentColor',
  className = '',
  stroke = 1.8,
}) {
  const IconComponent = TABLER_ICON_MAP[iconName] || IconHelpCircle;

  return (
    <span
      className={`cat-icon-center-box ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        verticalAlign: 'middle',
        width: '100%',
        height: '100%',
      }}
    >
      <IconComponent
        size={size}
        color={color}
        stroke={stroke}
        style={{
          display: 'block',
          margin: 'auto',
          flexShrink: 0,
        }}
      />
    </span>
  );
}
