import ROIWorksheet from './ROIWorksheet';
import CashflowWorksheet from './CashflowWorksheet';
import BreakevenWorksheet from './BreakevenWorksheet';
import UnitEconomicsWorksheet from './UnitEconomicsWorksheet';
import PersonalFinanceWorksheet from './PersonalFinanceWorksheet';
import FinancialWorksheet from './FinancialWorksheet';

const WorksheetRenderer = ({ worksheet, ventureId, onSave }) => {
  if (!worksheet) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Select a worksheet to view</p>
      </div>
    );
  }

  const worksheetProps = {
    ventureId,
    initialData: worksheet,
    onSave
  };

  switch (worksheet.type) {
    case 'roi':
    case 'roi_calculator':
      return <ROIWorksheet {...worksheetProps} />;
    
    case 'cashflow':
    case 'cashflow_forecast':
      return <CashflowWorksheet {...worksheetProps} />;
    
    case 'breakeven':
    case 'breakeven_analysis':
      return <BreakevenWorksheet {...worksheetProps} />;
    
    case 'unitEconomics':
    case 'unit_economics':
      return <UnitEconomicsWorksheet {...worksheetProps} />;
    
    case 'personal':
    case 'personal_finance':
      return <PersonalFinanceWorksheet {...worksheetProps} />;
    
    case 'loanPayment':
      return (
        <FinancialWorksheet
          type="loanPayment"
          {...worksheetProps}
        />
      );
    
    case 'npv':
      return (
        <FinancialWorksheet
          type="npv"
          {...worksheetProps}
        />
      );
    
    default:
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Worksheet type "{worksheet.type}" not supported yet
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Available types: ROI, Cashflow, Break-even, Unit Economics, Personal Finance
          </p>
        </div>
      );
  }
};

export default WorksheetRenderer;