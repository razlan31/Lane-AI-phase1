export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // --- 1. Fix hooks: remove default React import ---
  root.find(j.ImportDeclaration)
    .filter(path => path.node.source.value === "react")
    .forEach(path => {
      const specifiers = path.node.specifiers || [];
      const hasDefault = specifiers.some(s => s.type === "ImportDefaultSpecifier");
      const isHookFile = fileInfo.path.includes("/hooks/");

      if (isHookFile && hasDefault) {
        // Remove default React import in hooks
        path.node.specifiers = specifiers.filter(
          s => s.type !== "ImportDefaultSpecifier"
        );
        
        // If no specifiers left, remove the entire import
        if (path.node.specifiers.length === 0) {
          j(path).remove();
        }
      }
    });

  // --- 2. Components: remove unused React import ---
  root.find(j.ImportDeclaration, { source: { value: "react" } })
    .forEach(path => {
      const specifiers = path.node.specifiers || [];
      const hasDefault = specifiers.some(s => s.type === "ImportDefaultSpecifier");

      if (hasDefault) {
        const reactIdentifier = specifiers.find(
          s => s.type === "ImportDefaultSpecifier"
        ).local.name;

        // Check if "React" is used in the file (excluding the import itself)
        const reactUsages = root.find(j.Identifier, { name: reactIdentifier });
        const isUsed = reactUsages.filter(nodePath => {
          // Exclude the import declaration itself
          return !j.ImportDefaultSpecifier.check(nodePath.parent.node);
        }).size() > 0;

        if (!isUsed) {
          // Remove default React import if never used
          path.node.specifiers = specifiers.filter(
            s => s.type !== "ImportDefaultSpecifier"
          );
          
          // If no specifiers left, remove the entire import
          if (path.node.specifiers.length === 0) {
            j(path).remove();
          }
        }
      }
    });

  return root.toSource();
}