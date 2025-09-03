// Test React imports and availability
import React, { useState, useEffect } from 'react';

console.log('Test React import:', {
  React: typeof React,
  useState: typeof useState,
  useEffect: typeof useEffect,
  reactNull: React === null,
  useStateNull: useState === null
});

export const testHook = () => {
  try {
    const [test, setTest] = useState('working');
    console.log('Test hook useState call successful:', test);
    return test;
  } catch (error) {
    console.error('Test hook useState failed:', error);
    throw error;
  }
};

export default React;