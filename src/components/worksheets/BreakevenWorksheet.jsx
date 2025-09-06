import FinancialWorksheet from './FinancialWorksheet';

const BreakevenWorksheet = ({ ventureId, initialData, onSave }) => {
  return (
    <FinancialWorksheet
      type="breakeven"
      ventureId={ventureId}
      initialData={initialData}
      onSave={onSave}
    />
  );
};

export default BreakevenWorksheet;