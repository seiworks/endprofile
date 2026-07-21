const state = () => ({
    token: null,
    profile: null,
});

const mutations = {
    setToken(currentState, token) {
        currentState.token = token;
    },
    setProfile(currentState, profile) {
        currentState.profile = profile;
    },
};

const actions = {
    saveAuth({ commit }, { token, user }) {
        commit('setToken', token);
        commit('setProfile', user);
        if (typeof window !== 'undefined') {
            const data = JSON.stringify({ token, user });
            window.localStorage.setItem('auth', data);
        }
    },
    logout({ commit }) {
        commit('setToken', null);
        commit('setProfile', null);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('auth');
        }
    },
    initialize({ commit }) {
        if (typeof window === 'undefined') {
            return;
        }
        const raw = window.localStorage.getItem('auth');
        if (!raw) {
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.token && parsed.user) {
                commit('setToken', parsed.token);
                commit('setProfile', parsed.user);
            }
        } catch (e) {
            window.localStorage.removeItem('auth');
        }
    },
};

const getters = {
    isAuthenticated(currentState) {
        return !!currentState.token;
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};
