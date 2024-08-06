## To disable the webpack warning and error overlays (WARNING in shared module react...) while development, add the following:
```
client: {
  overlay: {
    warnings: false,
    errors: false,
  },
},
```
under the `devServer` property in the `webpack.config.ts`.
