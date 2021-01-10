{ pkgs ? import <nixpkgs> {} }:

let
  set = (pkgs.callPackage (builtins.toString ./app.nix) {});
in set // {
  package = set.package.overrideAttrs (attrs: {
    buildInputs = attrs.buildInputs ++ [
      pkgs.nodePackages.webpack-cli
      pkgs.nodePackages.webpack
    ];
    preRebuild = ''
      npm run-script build
    '';
  });
}
