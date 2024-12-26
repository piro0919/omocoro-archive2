import {
  IconCategory,
  IconHome,
  IconPencil,
  IconSettings,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { type JSX, type ReactNode, useMemo } from "react";
import { Tab, TabList, Tabs } from "react-tabs";
import styles from "./style.module.css";

type TabItem = {
  icon: ReactNode;
  label: string;
  path: string;
};

const TAB_ITEMS = [
  {
    icon: <IconHome size={24} />,
    label: "ホーム",
    path: "/",
  },
  {
    icon: <IconCategory size={24} />,
    label: "カテゴリー",
    path: "/category",
  },
  {
    icon: <IconPencil size={24} />,
    label: "ライター",
    path: "/writer",
  },
  {
    icon: <IconSettings size={24} />,
    label: "設定",
    path: "/setting",
  },
] as const;

function NavTab({
  item,
  onClick,
}: {
  item: TabItem;
  onClick: () => void;
}): JSX.Element {
  return (
    <Tab className={styles.tab} onClick={onClick}>
      {item.icon}
      <span>{item.label}</span>
    </Tab>
  );
}

export default function MobileNavigation(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const selectedIndex = useMemo(
    () => TAB_ITEMS.findIndex((item) => item.path === pathname),
    [pathname],
  );

  return (
    <Tabs onSelect={() => {}} selectedIndex={selectedIndex}>
      <TabList className={styles.tabList}>
        {TAB_ITEMS.map((item) => (
          <NavTab
            item={item}
            key={item.path}
            onClick={() => router.push(item.path)}
          />
        ))}
      </TabList>
    </Tabs>
  );
}
