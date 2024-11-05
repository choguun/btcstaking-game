module game_logic::world {
    use std::vector;
    use std::signer;

    struct World has key, store {}

    fun init() {
        let v = vector::empty<u64>();
        vector::push_back(&mut v, 5);
        vector::push_back(&mut v, 6);
    }


}