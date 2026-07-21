const state = () => ({
    profile: null,
});

const mutations = {
    setProfile(currentState, profile) {
        currentState.profile = profile;
    },
};

const actions = {
    saveAuth({ commit }, { user }) {
        commit('setProfile', user);
    },
    logout({ commit }) {
        commit('setProfile', null);
    },
    initialize({ commit }) {
        if (typeof window === 'undefined') {
            return;
        }
        commit('setProfile', null);
    },
};

const getters = {
    isAuthenticated(currentState) {
        return !!currentState.profile;
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
