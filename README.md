How-to launch:

1. Preparing

    a). 
      ```shell
      npm init gatsby
      ```
        follow "default" scenario

    b). create "secret.ts" file in directory: src/cardano/nft/
        then declare const "BLOCKFROST_API" and insert your API_KEY from Blockfrost: 

          ```
          export const BLOCKFROST_API ="API_KEY"
          ```

2.  Install dependencies

    ```shell
    npm install
    cd my-gatsby-site/
    npm install
    ```

3.  Run

    from route project directory: 

    ```shell
      npm run develop
    ```

    Your site is now running at http://localhost:8000
