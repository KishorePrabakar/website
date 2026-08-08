/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'jobspy-js': 'commonjs jobspy-js',
      'wreq-js': 'commonjs wreq-js',
    })
    return config
  },
}

module.exports = nextConfig