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

    // Auto-generate intelligent worksheets based on venture type and data
    const worksheets = [];

    // Food Truck Business - 6 auto-generated worksheets
    if (foodTruck) {
      worksheets.push(
        {
          user_id: user.id,
          venture_id: foodTruck.id,
          type: 'unit-economics',
          inputs: { 
            avg_order_value: 14.7, // Real data from KPIs
            daily_customers: 85, // Real data
            cost_per_order: 8.5, // Industry average (mock)
            operating_days: 26 // Industry average
          },
          outputs: { 
            monthly_revenue: 12500, 
            gross_margin: 42.2, // Calculated from industry averages
            unit_profit: 6.2 
          },
          confidence_level: 'mixed'
        },
        {
          user_id: user.id,
          venture_id: foodTruck.id,
          type: 'location-performance',
          inputs: { 
            peak_hours_revenue: 8750, // Mock - industry average
            off_peak_revenue: 3750, // Mock
            weekend_multiplier: 1.4, // Mock
            weather_impact: -15 // Mock
          },
          outputs: { location_score: 78, optimal_hours: "11am-2pm, 5pm-8pm" },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: foodTruck.id,
          type: 'cashflow',
          inputs: { 
            monthly_revenue: 12500, // Real
            food_costs: 4200, // Real calculation
            fuel_costs: 800, // Industry average
            permits: 450, // Industry average
            maintenance: 350 // Industry average
          },
          outputs: { net_cashflow: 4300, burn_rate: 8200 },
          confidence_level: 'mixed'
        },
        {
          user_id: user.id,
          venture_id: foodTruck.id,
          type: 'customer-acquisition',
          inputs: { 
            social_media_cac: 2.5, // Mock
            word_of_mouth: 65, // Mock percentage
            repeat_customer_rate: 35, // Mock
            new_customers_monthly: 180 // Mock
          },
          outputs: { blended_cac: 3.2, ltv_cac_ratio: 4.6 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: foodTruck.id,
          type: 'seasonal-planning',
          inputs: { 
            summer_multiplier: 1.3, // Mock
            winter_multiplier: 0.7, // Mock
            event_revenue: 2800, // Mock
            weather_sensitivity: 25 // Mock
          },
          outputs: { annual_forecast: 138000, seasonal_variance: 28 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: foodTruck.id,
          type: 'breakeven-analysis',
          inputs: { 
            fixed_costs: 5500, // Mix of real and mock
            variable_cost_ratio: 0.34, // Calculated
            break_even_orders: 374 // Calculated
          },
          outputs: { break_even_revenue: 5500, margin_of_safety: 56 },
          confidence_level: 'mixed'
        }
      );
    }

    // E-commerce Dropshipping - 6 auto-generated worksheets  
    if (dropship) {
      worksheets.push(
        {
          user_id: user.id,
          venture_id: dropship.id,
          type: 'unit-economics',
          inputs: { 
            aov: 68.8, // Real (calculated from revenue/orders)
            cac: 45, // Real
            gross_margin: 0.28, // Industry average (mock)
            fulfillment_cost: 8.5 // Mock
          },
          outputs: { unit_profit: 10.76, payback_period: 4.2 },
          confidence_level: 'mixed'
        },
        {
          user_id: user.id,
          venture_id: dropship.id,
          type: 'channel-performance',
          inputs: { 
            facebook_ads_cac: 42, // Mock
            google_ads_cac: 38, // Mock  
            organic_conversion: 2.8, // Mock
            email_conversion: 8.5 // Mock
          },
          outputs: { best_channel: "Google Ads", channel_efficiency: 76 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: dropship.id,
          type: 'inventory-planning',
          inputs: { 
            avg_inventory_days: 45, // Mock
            stockout_rate: 8, // Mock
            carrying_cost: 0.15, // Mock
            demand_variance: 35 // Mock
          },
          outputs: { optimal_stock_level: 850, reorder_point: 340 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: dropship.id,
          type: 'market-expansion',
          inputs: { 
            current_market_penetration: 0.02, // Mock
            addressable_market: 2400000, // Mock
            expansion_cost: 15000, // Mock
            new_market_cac: 62 // Mock
          },
          outputs: { expansion_roi: 240, time_to_roi: 8 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: dropship.id,
          type: 'cashflow',
          inputs: { 
            monthly_revenue: 28900, // Real
            cogs: 20832, // Calculated (72% of revenue)
            ad_spend: 9450, // Real (calculated from CAC)
            platform_fees: 1156 // Real (4% of revenue)
          },
          outputs: { net_cashflow: -2538, burn_rate: 31438 },
          confidence_level: 'mixed'
        },
        {
          user_id: user.id,
          venture_id: dropship.id,
          type: 'product-performance',
          inputs: { 
            top_product_revenue: 12600, // Mock
            product_count: 24, // Mock
            best_margin_product: 0.42, // Mock
            return_rate: 6.5 // Mock
          },
          outputs: { portfolio_score: 82, concentration_risk: 44 },
          confidence_level: 'mock'
        }
      );
    }

    // Freelance Web Design - 5 auto-generated worksheets
    if (freelance) {
      worksheets.push(
        {
          user_id: user.id,
          venture_id: freelance.id,
          type: 'project-profitability',
          inputs: { 
            avg_project_value: 2800, // Real
            active_clients: 6, // Real
            hours_per_project: 45, // Mock
            hourly_rate: 85 // Mock
          },
          outputs: { profit_per_project: 1625, utilization_rate: 78 },
          confidence_level: 'mixed'
        },
        {
          user_id: user.id,
          venture_id: freelance.id,
          type: 'client-lifetime-value',
          inputs: { 
            avg_client_tenure: 14, // Mock (months)
            projects_per_year: 4.2, // Mock
            referral_rate: 35, // Mock
            upsell_rate: 25 // Mock
          },
          outputs: { client_ltv: 11760, ltv_cac_ratio: 8.4 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: freelance.id,
          type: 'capacity-planning',
          inputs: { 
            billable_hours_week: 32, // Mock
            admin_hours_week: 8, // Mock
            pipeline_projects: 3, // Mock
            capacity_utilization: 80 // Mock
          },
          outputs: { max_monthly_revenue: 10880, growth_capacity: 28 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: freelance.id,
          type: 'pricing-strategy',
          inputs: { 
            market_rate_hourly: 95, // Mock
            current_rate: 85, // Mock (calculated)
            value_premium: 15, // Mock
            competitor_avg: 78 // Mock
          },
          outputs: { pricing_position: "Below Market", optimization_potential: 22 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: freelance.id,
          type: 'cashflow',
          inputs: { 
            monthly_revenue: 8500, // Real
            business_expenses: 1200, // Real
            tax_reserve: 0.25, // Mock
            equipment_depreciation: 150 // Mock
          },
          outputs: { net_cashflow: 5775, tax_liability: 2125 },
          confidence_level: 'mixed'
        }
      );
    }

    // Mobile App Startup - 6 auto-generated worksheets
    if (app) {
      worksheets.push(
        {
          user_id: user.id,
          venture_id: app.id,
          type: 'saas-metrics',
          inputs: { 
            mau: 2400, // Real
            mrr: 1850, // Real
            churn_rate: 8.5, // Mock (industry avg)
            arpu: 0.77 // Real (calculated)
          },
          outputs: { nps_score: 42, product_market_fit: 0.65 },
          confidence_level: 'mixed'
        },
        {
          user_id: user.id,
          venture_id: app.id,
          type: 'user-acquisition',
          inputs: { 
            organic_cac: 12, // Mock
            paid_cac: 28, // Mock
            viral_coefficient: 0.15, // Mock
            activation_rate: 45 // Mock
          },
          outputs: { blended_cac: 18.5, ltv_cac_ratio: 2.4 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: app.id,
          type: 'product-market-fit',
          inputs: { 
            retention_day_1: 68, // Real
            retention_day_7: 42, // Mock
            retention_day_30: 28, // Mock
            nps_score: 35 // Mock
          },
          outputs: { pmf_score: 0.65, growth_readiness: 72 },
          confidence_level: 'mixed'
        },
        {
          user_id: user.id,
          venture_id: app.id,
          type: 'funding-requirements',
          inputs: { 
            runway_months: 8, // Mock
            burn_rate: 12500, // Mock
            next_milestone_cost: 75000, // Mock
            revenue_growth_rate: 15 // Mock
          },
          outputs: { funding_needed: 150000, runway_extension: 12 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: app.id,
          type: 'growth-projections',
          inputs: { 
            current_growth_rate: 15, // Mock
            market_size: 50000000, // Mock
            feature_impact: 25, // Mock
            competition_factor: -5 // Mock
          },
          outputs: { twelve_month_projection: 6400, market_share: 0.013 },
          confidence_level: 'mock'
        },
        {
          user_id: user.id,
          venture_id: app.id,
          type: 'feature-impact',
          inputs: { 
            development_costs: 15000, // Real
            feature_adoption_rate: 35, // Mock
            revenue_lift: 8, // Mock
            churn_reduction: 12 // Mock
          },
          outputs: { feature_roi: 185, payback_months: 4.2 },
          confidence_level: 'mixed'
        }
      );
    }

    if (worksheets.length > 0) {
      const { error: wsErr } = await supabase.from('worksheets').insert(worksheets);
      if (wsErr) throw wsErr;
    }

    console.log('✅ Successfully created 4 test ventures with intelligent auto-generated worksheets');
    return { success: true, ventures, kpisCount: kpisData.length, worksheetsCount: worksheets.length };