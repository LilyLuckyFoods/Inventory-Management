"use client";

import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Boxes,
  Package,
  FilePieChart,
  Printer,
  Bot,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import type { Product, InventoryItem } from '@/types';
import { listenToCollection } from '@/lib/firestore';
import DashboardView from '@/components/dashboard-view';
import InventoryView from '@/components/inventory-view';
import ProductsView from '@/components/products-view';
import ReportsView from '@/components/reports-view';
import PrintableReport from '@/components/printable-report';
import RecommendationsDialog from '@/components/recommendations-dialog';
import { Button } from '@/components/ui/button';

type View = 'dashboard' | 'inventory' | 'products' | 'reports' | 'printable';

const StockPilotApp = () => {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const companyId = 'shared_company_id'; // Replace with real company ID

  useEffect(() => {
    if (user) {
      setLoadingData(true);
      const unsubProducts = listenToCollection<Product>(companyId, 'products', setProducts);
      const unsubInventory = listenToCollection<InventoryItem>(companyId, 'inventory', (data) => {
        setInventory(data);
        setLoadingData(false);
      });

      return () => {
        unsubProducts();
        unsubInventory();
      };
    } else {
      setProducts([]);
      setInventory([]);
      setLoadingData(false);
    }
  }, [user]);

  const renderView = () => {
    if (authLoading || (user && loadingData)) {
      return <div className="p-8"><Skeleton className="h-[400px] w-full" /></div>;
    }

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <Bot className="w-24 h-24 text-primary" />
          <h1 className="text-2xl font-bold">Welcome to StockPilot</h1>
          <p className="text-muted-foreground">Please sign in to manage your inventory.</p>
          <Button onClick={signIn}><LogIn className="mr-2" /> Sign In with Google</Button>
        </div>
      );
    }

    const viewProps = { products, inventory, userId: companyId };

    switch (activeView) {
      case 'dashboard':
        return <DashboardView {...viewProps} />;
      case 'inventory':
        return <InventoryView {...viewProps} />;
      case 'products':
        return <ProductsView {...viewProps} />;
      case 'reports':
        return <ReportsView {...viewProps} />;
      case 'printable':
        return <PrintableReport {...viewProps} />;
      default:
        return <DashboardView {...viewProps} />;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="items-center justify-center gap-2 group-data-[collapsible=icon]:hidden">
          <Bot className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold">StockPilot</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('dashboard')} isActive={activeView === 'dashboard'} tooltip="Dashboard" disabled={!user}>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('inventory')} isActive={activeView === 'inventory'} tooltip="Inventory" disabled={!user}>
                <Boxes />
                <span>Inventory</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('products')} isActive={activeView === 'products'} tooltip="Products" disabled={!user}>
                <Package />
                <span>Products</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('reports')} isActive={activeView === 'reports'} tooltip="Reports" disabled={!user}>
                <FilePieChart />
                <span>Reports</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('printable')} isActive={activeView === 'printable'} tooltip="Printable Report" disabled={!user}>
                <Printer />
                <span>Printable Report</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setIsRecommendationsOpen(true)} tooltip="AI Recommendations" disabled={!user}>
                <Bot />
                <span>AI Recommendations</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 flex-col gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.photoURL ?? `https://avatar.vercel.sh/${user.uid}.png`} alt="User" />
                <AvatarFallback>{user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-sidebar-foreground">{user.displayName}</span>
                <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
              </div>
            </div>
          )}
          {user && (
            <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2" onClick={signOut}>
              <LogOut className="mr-2 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background min-h-screen">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
          </div>
        </header>
        <main className="p-4 sm:px-6 sm:py-0">{renderView()}</main>
      </SidebarInset>

      {user && (
        <RecommendationsDialog
          isOpen={isRecommendationsOpen}
          onOpenChange={setIsRecommendationsOpen}
          inventory={inventory}
        />
      )}
    </SidebarProvider>
  );
};

export default StockPilotApp;

