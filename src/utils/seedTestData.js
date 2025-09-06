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

    console.log('✅ Successfully created 4 test ventures with complete KPI data');
    return { success: true, ventures, kpisCount: kpisData.length };

  } catch (error) {
    console.error('❌ Error creating test ventures:', error);
    return { success: false, error: error.message };
  }
};