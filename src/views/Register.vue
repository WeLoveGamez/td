<template>
    <div id="game">
        <div class="d-flex align-items-stretch justify-content-center flex-column" style="height: 100vh">
            <div class="card card-default w-50" style="margin-left: 25%">
                <div class="card-header header">Registrierung</div>
                <div class="card-body">
                    <form @submit.prevent="register()" autocomplete="off">
                        <div class="m-4 alert alert-danger text-center" v-if="error">{{ error }}</div>
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
                        <div class="p-1 row col-12">
                            <div class="col-6 offset-3">
                                <input minlength="3" class="form-control" id="confirm" type="password" placeholder="passwort" v-model="confirmed" autocomplete="off" />
                            </div>
                        </div>
                        <div class="row d-flex justify-content-center">
                            <div class="button m-4 col-2" @click="register()" v-if="!registering" style="background-color: ">Registrieren</div>
                            <span v-if="registering" class="m-4 spinner-border spinner-border-sm text-primary"></span>
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
            confirmed: '',
            password: '',
            email: '',
            error: '',
            registering: false,
        }
    },
    methods: {
        async register() {
            if (this.confirmed !== this.password) this.error = 'Die passwörter stimmen nicht überein'
            this.registering = true
            try {
                await API.register(this.email, this.password)
                this.$router.push('/game')
            } catch (e) {
                console.log("couldn't register", e)
                this.error = 'Der Account konnte leider nicht registriert werden'
            } finally {
                this.registering = false
            }
        },
    },
})
</script>
<style lang="scss" scoped>
.row {
    margin: 0px !important;
    & span {
        padding: 0% !important;
    }
}
* {
    text-align: center;
    font-family: Arial, Helvetica, sans-serif;
    color: rgb(255, 255, 255);
}
</style>
