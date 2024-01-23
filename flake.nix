{
  description = "A Nix flake for running a Node.js project with Cardano node";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-21.05";  # Use an appropriate Nixpkgs channel
    flake-utils.url = "github:numtide/flake-utils";
    cardano-node.url = "github:input-output-hk/cardano-node";  # Cardano node source
  };

  outputs = { self, nixpkgs, flake-utils, cardano-node }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        nodejs = pkgs.nodejs-14_x;  # Choose the appropriate Node.js version
        cardano-cli = cardano-node.packages.${system}.cardano-cli;
      in {
        devShell = pkgs.mkShell {
          buildInputs = [ nodejs cardano-cli ];
          shellHook = ''
            echo "Run 'npm install' to install Node.js dependencies."
            echo "Cardano CLI is available for use."
          '';
        };
      }
    );
}
