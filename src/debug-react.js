// Debug script to check React imports
import React from 'react';

console.log('React import in debug file:', React);
console.log('useState from React:', React.useState);

export const debugReact = () => {
  console.log('React available in debugReact:', !!React);
  return React;
};