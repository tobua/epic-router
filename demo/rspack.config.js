// Configure preact transformer.
export default (configuration) => {
  // NOTE react installed in parent folder will interfere.
  configuration.resolve.alias = {
    react: 'preact/compat',
    'react-dom/test-utils': 'preact/test-utils',
    'react-dom': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime',
    'react/jsx-dev-runtime': 'preact/jsx-dev-runtime',
  }

  return configuration
}
