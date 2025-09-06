import FinancialWorksheet from './FinancialWorksheet';

const CashflowWorksheet = ({ ventureId, initialData, onSave }) => {
  return (
    <FinancialWorksheet
      type="cashflow"
      ventureId={ventureId}
      initialData={initialData}
      onSave={onSave}
    />
  );
};

export default CashflowWorksheet;