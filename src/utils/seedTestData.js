import { supabase } from '@/integrations/supabase/client';

export const createTestVentures = async () => {
  try {
    console.log('🌱 Starting to create test ventures...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if ventures already exist
    const { data: existingVentures, error: checkError } = await supabase
      .from('ventures')
      .select('*')
      .eq('user_id', user.id);

    if (checkError) throw checkError;

    if (existingVentures && existingVentures.length > 0) {
      console.log('Test ventures already exist, skipping creation');
      return existingVentures;
    }

    // Create just ONE test venture first
    const venturePayload = {
      user_id: user.id,
      name: 'Gourmet Street Eats',
      description: 'Mobile food truck serving artisanal burgers and craft sodas in downtown area',
      type: 'local_business',
      stage: 'operational'
    };

    console.log('Creating venture:', venturePayload);

    // Insert venture
    const { data: ventures, error: venturesError } = await supabase
      .from('ventures')
      .insert([venturePayload])
      .select('*');

    if (venturesError) {
      console.error('Error creating venture:', venturesError);
      throw venturesError;
    }

    const venture = ventures[0];
    console.log('✅ Created venture:', venture);

    // Create KPIs for the venture
    const kpiPayloads = [
      {
        venture_id: venture.id,
        name: 'Monthly Revenue',
        value: 8500,
        confidence_level: 'live'
      },
      {
        venture_id: venture.id,
        name: 'Customer Count',
        value: 342,
        confidence_level: 'live'
      },
      {
        venture_id: venture.id,
        name: 'Average Order Value',
        value: 24.85,
        confidence_level: 'live'
      }
    ];

    console.log('Creating KPIs:', kpiPayloads);

    const { data: kpis, error: kpisError } = await supabase
      .from('kpis')
      .insert(kpiPayloads)
      .select('*');

    if (kpisError) {
      console.error('Error creating KPIs:', kpisError);
      throw kpisError;
    }

    console.log('✅ Created KPIs:', kpis);

    // Create 3 worksheets for the venture
    const worksheetPayloads = [
      {
        user_id: user.id,
        venture_id: venture.id,
        type: 'unit-economics',
        confidence_level: 'mixed',
        inputs: {
          avg_order_value: 24.85,
          cost_per_unit: 8.50,
          monthly_customers: 342,
          operating_costs: 3200
        },
        outputs: {
          gross_margin: 16.35,
          monthly_profit: 2394,
          profit_margin: 28.2,
          break_even_customers: 196
        }
      },
      {
        user_id: user.id,
        venture_id: venture.id,
        type: 'cashflow',
        confidence_level: 'benchmark',
        inputs: {
          monthly_revenue: 8500,
          fixed_costs: 2800,
          variable_costs: 5106,
          seasonal_factor: 1.2
        },
        outputs: {
          net_cashflow: 594,
          cash_runway: 8.4,
          peak_season_revenue: 10200,
          breakeven_revenue: 7906
        }
      },
      {
        user_id: user.id,
        venture_id: venture.id,
        type: 'location-performance',
        confidence_level: 'estimate',
        inputs: {
          daily_foot_traffic: 145,
          conversion_rate: 12.5,
          peak_hours: 4,
          location_rent: 800
        },
        outputs: {
          daily_customers: 18,
          revenue_per_sqft: 42.50,
          location_roi: 156,
          optimal_hours: 6
        }
      }
    ];

    console.log('Creating worksheets:', worksheetPayloads);

    const { data: worksheets, error: worksheetsError } = await supabase
      .from('worksheets')
      .insert(worksheetPayloads)
      .select('*');

    if (worksheetsError) {
      console.error('Error creating worksheets:', worksheetsError);
      throw worksheetsError;
    }

    console.log('✅ Created worksheets:', worksheets);
    console.log('🎉 Successfully created test venture with KPIs and worksheets!');
    
    return ventures;

  } catch (error) {
    console.error('❌ Error creating test ventures:', error);
    throw error;
  }
};