import { createStore } from 'vuex';
import user from './user';
import endprofile from './endprofile';
import documents from './documents';

const store = createStore({
    modules: {
        user,
        endprofile,
        documents,
    },
});

export default store;

