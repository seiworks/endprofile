const state = () => ({
    items: [],
    current: null,
});

const mutations = {
    setItems(currentState, items) {
        currentState.items = items;
    },
    setCurrent(currentState, doc) {
        currentState.current = doc;
    },
};

const actions = {
    saveList({ commit }, items) {
        commit('setItems', items);
    },
    open({ commit }, doc) {
        commit('setCurrent', doc);
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};

