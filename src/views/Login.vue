<template>
    <div id="game">
        <div class="d-flex justify-content-center flex-column" style="height: 100vh">
            <div class="card w-50" style="margin-left: 25%">
                <div class="card-header">Login</div>
                <div class="card-body">
                    <form autocomplete="off">
                        <div class="m-4 alert alert-danger text-center" v-if="error">Username or password is not correct</div>
                        <div class="p-1 row col-12">
                            <div class="col-6 offset-3">
                                <input minlength="3" class="form-control" id="email" type="text" placeholder="email" v-model="email" autocomplete="off" />
                            </div>
                        </div>
                        <div class="p-1 row col-12">
                            <div class="col-6 offset-3">
                                <input minlength="3" class="form-control" id="password" type="password" placeholder="passwort" v-model="password" autocomplete="off" />
                            </div>
                        </div>
                        <div class="row d-flex justify-content-center">
                            <div class="button m-4 col-2" @click="login()" v-if="!loggingIn">Anmelden</div>
                            <span v-if="loggingIn" class="m-4 spinner-border spinner-border-sm text-primary"></span>
                            <div class="button m-4 col-2" type="button" v-if="!loggingIn" @click="register()">Registrieren</div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as API from '@/API'

export default defineComponent({
    data() {
        return {
            password: '',
            email: '',
            error: false,
            loggingIn: false,
        }
    },
    methods: {
        async login() {
            this.error = false
            this.loggingIn = true
            try {
                await API.login(this.email, this.password)
                console.log('logged in with:' + this.email)
                this.email = ''
                this.password = ''
                this.$router.push('/main')
            } catch (e) {
                console.error({ "couldn't login": e })
            } finally {
                this.password = ''
                this.error = true
                this.loggingIn = false
            }
        },
        register() {
            this.$router.push('/register')
        },
    },
})
</script>
<style lang="scss" scoped>
* {
    text-align: center;
    font-family: Arial, Helvetica, sans-serif;
    color: rgb(255, 255, 255);
}
.row {
    margin: 0px !important;
    & span {
        padding: 0% !important;
    }
}
</style>
