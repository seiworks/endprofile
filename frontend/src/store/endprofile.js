const state = () => ({
  data: null,
});

const mutations = {
  setData(currentState, payload) {
    currentState.data = payload;
  },
};

const actions = {
  save({ commit }, payload) {
    commit('setData', payload);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

