'use strict';

import consts from "./../../tools/client/hooks/consts"
import { AsyncStorage } from 'react-native';

class HooksList {

    constructor(hooksRepository) {

        this.hooksRepository = hooksRepository;

    }

    addHooks() {
        console.log("addHooks web")


        this.hooksRepository.addHook(consts.AUTH, consts.HOOK__BEFORE_LOGIN, this.beforeLogin);
        this.hooksRepository.addHook(consts.AUTH, consts.HOOK__AFTER_LOGIN, this.afterLogin);

    }


    async afterLogin(res) {

        console.log("hhh auth afterLogin web", res)




    }
    beforeLogin() {
        console.log("hhh auth beforeLogin web")

    }
}
export default HooksList;
