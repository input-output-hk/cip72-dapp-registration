#!/bin/bash

for i in {1..16}; do
  folder_number=$(printf "%03d" $i)
  npx ajv validate -s ../bin/offChainDataSchema.json -d ./$folder_number/offchain-metadata.json
done

