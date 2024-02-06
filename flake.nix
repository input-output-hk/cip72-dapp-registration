{
  description = "A Nix flake for running a Node.js project with Cardano node and Cardano address";

  inputs = {
    cardano-node.url   = "github:IntersectMBO/cardano-node/8.7.3";
    haskellNix.follows = "cardano-node/haskellNix";
    nixpkgs.follows    = "cardano-node/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, cardano-node, haskellNix, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ haskellNix.overlay ];
        };
        nodejs = pkgs.nodejs_20;
        cardanoCli = cardano-node.packages.${system}.cardano-cli;
        cardanoNode = cardano-node.packages.${system}.cardano-node;
        tmux = pkgs.tmux;
        ghc = pkgs.haskellPackages.ghc;
        cabalInstall = pkgs.haskellPackages.cabal-install;
        cardanoAddress = pkgs.stdenv.mkDerivation {
          name = "cardano-address";
          src = pkgs.fetchurl {
            url = "https://github.com/IntersectMBO/cardano-addresses/releases/download/3.12.0/cardano-addresses-3.12.0-linux64.tar.gz";
            sha256 = "sha256-9xgp9+Z0sv9CXtav4/20+7m5qJCiAuge1M1cD3BvEkA=";
          };
          installPhase = ''
            mkdir -p $out/bin
            tar -xzf $src -C $out/bin --strip-components=1
            chmod +x $out/bin/cardano-address
          '';
        };
        buildTools = with pkgs; [
          gnumake
          python3
          pkg-config
          gcc
          binutils
        ];

      in {
        devShell = pkgs.mkShell {
          buildInputs = [ nodejs cardanoCli cardanoNode tmux cardanoAddress ghc cabalInstall ] ++ buildTools;
          shellHook = ''
            # Install bech32 using cabal
            cabal update
            cabal install bech32
            export PATH=$PATH:$HOME/.local/bin
            npm install
            read -p "Do you want to start cardano-node? (Y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]
            then
              echo "Configuring tmux for cardano-node..."
              tmux new-session \; \
                split-window -v \; \
                select-pane -t 0 \; \
                send-keys "export CARDANO_NODE_SOCKET_PATH=./cardano-node.socket" C-m \; \
                send-keys "cardano-node run \
                  --socket-path ./cardano-node.socket \
                  --topology ./linux/preprod/topology.yaml \
                  --database-path ./chain \
                  --port 46859 \
                  --config ./linux/preprod/config.yaml \
                  --host-addr 127.0.0.1" C-m \; \
                select-pane -t 1
            else
              echo "Skipping cardano-node startup."
            fi
          '';
        };
      }
    );
}
