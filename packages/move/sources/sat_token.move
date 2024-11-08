// SPDX-License-Identifier: MIT
// sat_token.move
module btcstaking::sat_token {

    use std::string;
    use std::option;
    use moveos_std::signer;
    
    use moveos_std::object::{Self, Object};
    use rooch_framework::coin;
    use rooch_framework::coin_store::{Self, CoinStore};
    use rooch_framework::account_coin_store;
    use moveos_std::account::{move_resource_to, borrow_mut_resource, borrow_resource};
    use rooch_framework::coin::{CoinInfo, mint_extend, Coin};
    use moveos_std::signer::{module_signer, address_of};
    use rooch_framework::gas_coin::{RGas, decimals};

    friend btcstaking::game_logic;

    const DECIMALS: u8 = 1u8;

    // The `SAT` CoinType has `key` and `store` ability.
    // So `SAT` coin is public.
    struct SAT<phantom CoinType: key+store> has key, store {}

    struct NativeCoinInfo<phantom CoinType: key+store> has key {
        coin_info_obj: Object<CoinInfo<SAT<CoinType>>>,
    }

    fun init() {
        let coin_info_obj = coin::register_extend<SAT<RGas>>(
            
            string::utf8(b"SAT Coin"),
            string::utf8(b"SAT"),
            option::some(string::utf8(b"SAT Coin")),
            DECIMALS,
        );
         let module_signer = module_signer<NativeCoinInfo<RGas>>();
        move_resource_to(&module_signer, NativeCoinInfo<RGas>{
            coin_info_obj
        })
    }

    public(friend) fun borrow_coin_info<CoinType: key+store>(): &CoinInfo<SAT<CoinType>>{
        let module_signer = module_signer<SAT<CoinType>>();
        object::borrow(&borrow_resource<NativeCoinInfo<CoinType>>(address_of(&module_signer)).coin_info_obj)
    }

    public(friend) fun mint<CoinType: key+store>(amount: u256): Coin<SAT<CoinType>>{
        let module_signer = module_signer<SAT<CoinType>>();
        let coin_info_obj = borrow_mut_resource<NativeCoinInfo<CoinType>>(address_of(&module_signer));
        mint_extend<SAT<CoinType>>(&mut coin_info_obj.coin_info_obj, amount)
    }

    public fun burn<CoinType: key+store>(amount: Coin<SAT<CoinType>>) {
        let module_signer = module_signer<SAT<CoinType>>();
        let coin_info_obj = borrow_mut_resource<NativeCoinInfo<CoinType>>(address_of(&module_signer));
        coin::burn<SAT<CoinType>>(&mut coin_info_obj.coin_info_obj, amount)
    }
}