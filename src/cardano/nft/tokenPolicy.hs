{-# LANGUAGE DataKinds           #-}
{-# LANGUAGE DeriveAnyClass      #-}
{-# LANGUAGE DeriveGeneric       #-}
{-# LANGUAGE FlexibleContexts    #-}
{-# LANGUAGE NoImplicitPrelude   #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE TemplateHaskell     #-}
{-# LANGUAGE TypeApplications    #-}
{-# LANGUAGE TypeFamilies        #-}
{-# LANGUAGE TypeOperators       #-}
​
module GCOIN.Example where
​
​
import           Prelude hiding (($)
import           Cardano.Api.Shelley (PlutusScript (..), PlutusScriptV1, serialiseToCBOR)
import           Codec.Serialise
import qualified Data.ByteString.Lazy as LB
import qualified Data.ByteString.Short as SBS
import           Ledger hiding (singleton)
import qualified Ledger.Typed.Scripts as Scripts
import qualified PlutusTx
import           PlutusTx.Prelude hiding (Semigroup (..), unless, (.))
import qualified Plutus.V1.Ledger.Api                 as PlutusV1
import qualified Plutus.V1.Ledger.Interval            as PlutusV1
import qualified Data.ByteString as B
import qualified Data.ByteString.Base16               as B16
import qualified Plutus.V2.Ledger.Api                 as PlutusV2
​
--v 1.0.0 of plutus-apps
​
{-# INLINABLE mkPolicy #-}
mkPolicy :: () -> ScriptContext -> Bool
mkPolicy  _ ctx = True
​
policyV1 ::  Scripts.MintingPolicy
policyV1 = PlutusV1.mkMintingPolicyScript 
        $$(PlutusTx.compile [||Scripts.mkUntypedMintingPolicy  mkPolicy||])
    
​
validator :: Scripts.Validator
validator =
  PlutusV1.Validator $ PlutusV1.unMintingPolicyScript policyV1
​
​
printText :: B.ByteString
printText  = B16.encode $ serialiseToCBOR ((PlutusScriptSerialised $ SBS.toShort . LB.toStrict $ serialise $ PlutusV1.unMintingPolicyScript  policyV1) :: PlutusScript PlutusScriptV1)
​
​
{-# INLINABLE mkPolicyV2 #-}
mkPolicyV2 :: PlutusV2.POSIXTime -> BuiltinData -> PlutusV2.ScriptContext -> Bool
mkPolicyV2 dl _ ctx = PlutusV2.from dl `PlutusV1.contains` range -- there's no Plutus.V2.Ledger.Interval
  where
    info :: PlutusV2.TxInfo
    info = PlutusV2.scriptContextTxInfo ctx
​
    range :: PlutusV2.POSIXTimeRange
    range = PlutusV2.txInfoValidRange info
​
policyV2 :: PlutusV2.POSIXTime -> Scripts.MintingPolicy
policyV2 s = PlutusV2.mkMintingPolicyScript $
        $$(PlutusTx.compile [||Scripts.mkUntypedMintingPolicy . mkPolicyV2||])
        `PlutusTx.applyCode`
        PlutusTx.liftCode s