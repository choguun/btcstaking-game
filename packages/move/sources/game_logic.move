// SPDX-License-Identifier: MIT
// game_logic.move
module btcstaking::game_logic {
    use std::string;
    use std::option;
    use std::vector;
    use std::bcs;
    use std::hash;
    use moveos_std::signer;
    use moveos_std::timestamp;
    use moveos_std::tx_context::{Self, sender};
    use moveos_std::object::{Self, Object, transfer, borrow, exists};
    use moveos_std::event::emit;
    use moveos_std::signer::{module_signer, address_of};
    use rooch_framework::coin::{Self, Coin, CoinInfo};
    use rooch_framework::account_coin_store;
    use rooch_framework::gas_coin::{Self};
    use rooch_framework::simple_rng;
    use bitcoin_move::utxo::{Self, UTXO};
    use bitcoin_move::bitcoin;
    use bitcoin_move::types::{Self, Header};
    use btcstaking::sat_token::{Self, SAT, borrow_coin_info};

    /// The decimals of the `BTC Holder Coin`
    const DECIMALS: u8 = 1u8;
    const PROTOCOL_FEE: u256 = 10;
    /// ERROR Message
    const ErrorAlreadyStaked: u64 = 1;
    const ErrorAlreadyClaimed: u64 = 2;

    struct HDC has key, store {}

    struct CoinInfoHolder has key {
        coin_info: Object<CoinInfo<HDC>>,
    }

    /// The stake info of UTXO
    /// This Info store in the tempory state area of UTXO
    /// If the UTXO is spent, the stake info will be removed
    struct StakeInfo has store, drop {
        start_time: u64,
        last_cliam_time: u64,
    }

    struct WorldInfo has key, store {
        total_chip: u64,
        protocol_fee: u256,
        collect_fee: u256,
    }

    struct BattleRoom has key, store {
        battle_room_id: u64,
        player1: address,
        player2: address,
        player1_chip: u64,
        player2_chip: u64,
    }

    /// Capability to modify parameter
    struct AdminCap has key, store, drop {}

    struct CreateGameEvent has copy, drop {}
    struct CreateBattleRoomEvent has copy, drop {
        battleRoomId: u64,
        player: address,
    }
    struct JoinBattleRoomEvent has copy, drop {
        battleRoomId: u64,
        player: address,
    }
    struct BattleEvent has copy, drop {
        battleRoomId: u64,
        winner: address,
    }

    fun init() {
        let coin_info_obj = coin::register_extend<HDC>(
            string::utf8(b"BTC Holder Coin"),
            string::utf8(b"HDC"),
            option::some(string::utf8(b"BTC Holder Coin")),
            DECIMALS,
        );
        let coin_info_holder_obj = object::new_named_object(CoinInfoHolder { coin_info: coin_info_obj });
        // Make the coin info holder object to shared, so anyone can get mutable CoinInfoHolder object
        object::to_shared(coin_info_holder_obj);

        let world_info = object::new_named_object(WorldInfo {
            total_chip: 0,
            protocol_fee: PROTOCOL_FEE,
            collect_fee: 0,
        });
        object::to_shared(world_info);

        let admin_cap = object::new_named_object(AdminCap {});
        transfer(admin_cap, sender());
        emit(CreateGameEvent {});
    }

    /// Stake the UTXO to get the `BTC Holder Coin`
    public fun do_stake(utxo: &mut Object<UTXO>) {
        assert!(!utxo::contains_temp_state<StakeInfo>(utxo), ErrorAlreadyStaked);
        let now = timestamp::now_seconds();
        let stake_info = StakeInfo { start_time: now, last_cliam_time: now };
        utxo::add_temp_state(utxo, stake_info);
    }

    /// Claim the `BTC Holder Coin` from the UTXO
    public fun do_claim(coin_info_holder_obj: &mut Object<CoinInfoHolder>, utxo_obj: &mut Object<UTXO>): Coin<HDC> {
        let utxo_value = utxo::value(object::borrow(utxo_obj));
        let stake_info = utxo::borrow_mut_temp_state<StakeInfo>(utxo_obj);
        let now = timestamp::now_seconds();
        assert!(stake_info.last_cliam_time < now, ErrorAlreadyClaimed);
        let coin_info_holder = object::borrow_mut(coin_info_holder_obj);
        let mint_amount = (((now - stake_info.last_cliam_time) * utxo_value) as u256);
        let coin = coin::mint_extend(&mut coin_info_holder.coin_info, mint_amount);
        stake_info.last_cliam_time = now;
        coin
    }

    public entry fun stake(utxo: &mut Object<UTXO>) {
       do_stake(utxo);
    }

    public entry fun claim(coin_info_holder_obj: &mut Object<CoinInfoHolder>, utxo: &mut Object<UTXO>) {
        let coin = do_claim(coin_info_holder_obj, utxo);
        let sender = tx_context::sender();
        account_coin_store::deposit(sender, coin);
    }

    public entry fun mint_chip<CoinType: key+store>(signer: &signer, amount: u256) {
        // mint sat coin
        account_coin_store::deposit(address_of(signer), sat_token::mint<CoinType>(amount));
    }

    public entry fun create_battle_room(world_info: &mut Object<WorldInfo>, bet_chip: u64) {
        let battle_room_id = timestamp::now_seconds() / 100000;
        let world = object::borrow_mut(world_info);
        world.total_chip = world.total_chip + bet_chip;

        let battle_room = object::new_named_object(BattleRoom {
            battle_room_id: battle_room_id,
            player1: tx_context::sender(),
            player2: @0x0,
            player1_chip: bet_chip,
            player2_chip: 0,
        });

        object::to_shared(battle_room);

        emit(CreateBattleRoomEvent { battleRoomId: battle_room_id, player: tx_context::sender() });
    }

    /// Function to query a `BattleRoom` by `battle_room_id`
    public fun get_battle_room_by_id(battle_room_id: u64): Option<&BattleRoom> {
        if (exists<BattleRoom>(battle_room_id)) {
            return Option::some(borrow<BattleRoom>(battle_room_id));
        } else {
            return Option::none();
        }
    }

    public entry fun join_battle_room(world_info: &mut Object<WorldInfo>, battle_room_id: u64, bet_chip: u64) {
        let world = object::borrow_mut(world_info);
        world.total_chip = world.total_chip + bet_chip;

        let battle_room = find_battle_room(battle_room_id);
        
        
        emit(JoinBattleRoomEvent { battleRoomId: battle_room_id, player: tx_context::sender() });
    }

    public entry fun battle(world_info: &mut Object<WorldInfo>, battle_room_id: u64, winner: address) {
        let battle_room = object::borrow_shared<BattleRoom>(battle_room_id);
        let battle_room = object::borrow_mut(battle_room);
        let world = object::borrow_mut(world_info);

        let total_chip = battle_room.player1_chip + battle_room.player2_chip;
        if winner == battle_room.player1 {
            account_coin_store::deposit(battle_room.player1, Coin<HDC>(total_chip));
        } else {
            account_coin_store::deposit(battle_room.player2, Coin<HDC>(total_chip));
        }

        world.total_chip = world.total_chip - total_chip;
    }

    // admin part
    public entry fun config_fees(fees: u256, world_info: &mut Object<WorldInfo>, _admin: &mut Object<AdminCap>) {
        let world = object::borrow_mut(world_info);
        world.protocol_fee = fees;
    }

    fun generate_random(block: &Header, magic_number: u128) {
        // generate the box with the block hash and the magic number
        let bytes = vector::empty<u8>();
        vector::append(&mut bytes, bcs::to_bytes(block));
        vector::append(&mut bytes, bcs::to_bytes(&magic_number));
        vector::append(&mut bytes, bcs::to_bytes(&tx_context::sequence_number()));
        vector::append(&mut bytes, bcs::to_bytes(&tx_context::sender()));
        vector::append(&mut bytes, bcs::to_bytes(&tx_context::tx_hash()));

        let seed = hash::sha3_256(bytes);
        let value = simple_rng::bytes_to_u128(seed);

        let rand_value = value % 10000; // An uniform distribution random number range in [0, 10000)
    }
}