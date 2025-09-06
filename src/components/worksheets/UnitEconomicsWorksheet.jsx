import FinancialWorksheet from './FinancialWorksheet';

const UnitEconomicsWorksheet = ({ ventureId, initialData, onSave }) => {
  return (
    <FinancialWorksheet
      type="unitEconomics"
      ventureId={ventureId}
      initialData={initialData}
      onSave={onSave}
    />
  );
};

export default UnitEconomicsWorksheet;