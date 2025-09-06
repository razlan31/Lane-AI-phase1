import { supabase } from '@/integrations/supabase/client';

export const createTestVentures = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create the 4 test ventures
    const venturePayloads = [
      {
        user_id: user.id,
        name: 'Gourmet Street Eats',
        description: 'Mobile food truck serving artisanal burgers and craft sodas in downtown area',
        type: 'local_business',
        stage: 'operational'
      },
      {
        user_id: user.id,
        name: 'TechGadget Hub',
        description: 'Dropshipping business specializing in consumer electronics and smart home devices',
        type: 'ecommerce',
        stage: 'growth'
      },
      {
        user_id: user.id,
        name: 'Digital Craft Studio',
        description: 'Freelance web design and development services for small to medium businesses',
        type: 'service_business',
        stage: 'operational'
      },
      {
        user_id: user.id,
        name: 'FitTracker Pro',
        description: 'Mobile fitness tracking app with social features and personalized workout plans',
        type: 'startup',
        stage: 'mvp'
      }
    ];

    // Insert ventures
    const { data: ventures, error: venturesError } = await supabase
      .from('ventures')
      .insert(venturePayloads)
      .select('*');

    if (venturesError) throw venturesError;

    // Create KPIs for each venture
    const kpisData = [];
    
    // Food truck KPIs
    const foodTruck = ventures.find(v => v.name === 'Gourmet Street Eats');
    if (foodTruck) {
      kpisData.push(
        { venture_id: foodTruck.id, name: 'Monthly Revenue', value: 12500, confidence_level: 'actual' },
        { venture_id: foodTruck.id, name: 'Daily Customers', value: 85, confidence_level: 'actual' },
        { venture_id: foodTruck.id, name: 'Average Order Value', value: 14.7, confidence_level: 'actual' },
        { venture_id: foodTruck.id, name: 'Monthly Burn Rate', value: 8200, confidence_level: 'estimate' }
      );
    }

    // Dropshipping KPIs
    const dropship = ventures.find(v => v.name === 'TechGadget Hub');
    if (dropship) {
      kpisData.push(
        { venture_id: dropship.id, name: 'Monthly Revenue', value: 28900, confidence_level: 'actual' },
        { venture_id: dropship.id, name: 'Conversion Rate', value: 3.2, confidence_level: 'actual' },
        { venture_id: dropship.id, name: 'Customer Acquisition Cost', value: 45, confidence_level: 'estimate' },
        { venture_id: dropship.id, name: 'Monthly Orders', value: 420, confidence_level: 'actual' }
      );
    }

    // Freelancing KPIs
    const freelance = ventures.find(v => v.name === 'Digital Craft Studio');
    if (freelance) {
      kpisData.push(
        { venture_id: freelance.id, name: 'Monthly Revenue', value: 8500, confidence_level: 'actual' },
        { venture_id: freelance.id, name: 'Active Clients', value: 6, confidence_level: 'actual' },
        { venture_id: freelance.id, name: 'Average Project Value', value: 2800, confidence_level: 'actual' },
        { venture_id: freelance.id, name: 'Monthly Expenses', value: 1200, confidence_level: 'actual' }
      );
    }

    // App business KPIs
    const app = ventures.find(v => v.name === 'FitTracker Pro');
    if (app) {
      kpisData.push(
        { venture_id: app.id, name: 'Monthly Active Users', value: 2400, confidence_level: 'actual' },
        { venture_id: app.id, name: 'Monthly Recurring Revenue', value: 1850, confidence_level: 'actual' },
        { venture_id: app.id, name: 'User Retention Rate', value: 68, confidence_level: 'estimate' },
        { venture_id: app.id, name: 'Development Costs', value: 15000, confidence_level: 'actual' }
      );
    }

    // Insert all KPIs
    const { error: kpisError } = await supabase
      .from('kpis')
      .insert(kpisData);

    if (kpisError) throw kpisError;

    // Create supporting worksheets for each venture
    const worksheets = [];

    if (foodTruck) {
      worksheets.push(
        {
          user_id: user.id,
          venture_id: foodTruck.id,
          type: 'cashflow',
          inputs: { revenue_streams: [{ name: 'Food sales', amount: 12500 }], expenses: [{ name: 'Operating', amount: 8200 }] },
          outputs: { monthly_revenue: 12500, monthly_burn: 8200, net_cashflow: 12500 - 8200 },
          confidence_level: 'actual'
        },
        {
          user_id: user.id,
          venture_id: foodTruck.id,
          type: 'unit-economics',
          inputs: { avg_order_value: 14.7, daily_customers: 85 },
          outputs: { monthly_orders: 85 * 26, average_order_value: 14.7 },
          confidence_level: 'estimate'
        }
      );
    }

    if (dropship) {
      worksheets.push(
        {
          user_id: user.id,
          venture_id: dropship.id,
          type: 'cashflow',
          inputs: { orders: 420, aov: 68.8, cac: 45 },
          outputs: { monthly_revenue: 28900, conversion_rate: 3.2, monthly_orders: 420 },
          confidence_level: 'actual'
        },
        {
          user_id: user.id,
          venture_id: dropship.id,
          type: 'unit-economics',
          inputs: { cac: 45, aov: 68.8 },
          outputs: { gross_margin: 0.45 },
          confidence_level: 'estimate'
        }
      );
    }

    if (freelance) {
      worksheets.push(
        {
          user_id: user.id,
          venture_id: freelance.id,
          type: 'cashflow',
          inputs: { active_clients: 6, avg_project_value: 2800, monthly_expenses: 1200 },
          outputs: { monthly_revenue: 8500, monthly_expenses: 1200, net_cashflow: 8500 - 1200 },
          confidence_level: 'actual'
        }
      );
    }

    if (app) {
      worksheets.push(
        {
          user_id: user.id,
          venture_id: app.id,
          type: 'saas-metrics',
          inputs: { mau: 2400, mrr: 1850, retention: 68 },
          outputs: { monthly_active_users: 2400, mrr: 1850, retention_rate: 68 },
          confidence_level: 'actual'
        }
      );
    }

    if (worksheets.length > 0) {
      const { error: wsErr } = await supabase.from('worksheets').insert(worksheets);
      if (wsErr) throw wsErr;
    }

    console.log('✅ Successfully created 4 test ventures with complete KPI data and worksheets');
    return { success: true, ventures, kpisCount: kpisData.length, worksheetsCount: worksheets.length };