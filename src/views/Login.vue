<template>
    <div class="container d-flex align-items-stretch justify-content-center flex-column" style="height: 100vh">
        <div class="card w-75" style="margin-left: 12.5%">
            <div class="card-header">Login</div>
            <div class="card-body">
                <form @submit.prevent="login()" autocomplete="off">
                    <div class="m-4 alert alert-danger text-center" v-if="error">Username or password is not correct</div>
                    <div class="p-4 row col-12">
                        <div class="col-6 offset-3">
                            <SexyInput type="email" placeholder="email" :label-border="true" v-model="email" :error="errors.email"></SexyInput>
                        </div>
                    </div>
                    <div class="p-4 row col-12">
                        <div class="col-6 offset-3">
                            <SexyInput type="password" placeholder="password" :label-border="true" v-model="password" minlength="6" :error="errors.password"></SexyInput>
                        </div>
                    </div>
                    <button class="btn btn-success m-4 col-2" type="submit" v-if="!loggingIn">Anmelden</button>
                    <span v-if="loggingIn" class="m-4 spinner-border spinner-border-sm text-primary"></span>
                    <button class="btn btn-info m-4 col-2" type="button" @click="register()">Registrieren</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as API from '@/API'
import SexyInput from '@/components/SexyInputs.vue'

export default defineComponent({
    components: {
        SexyInput,
    },
    data() {
        return {
            password: '',
            email: '',
            error: false,
            loggingIn: false,
            errors: {} as any,
        }
    },
    methods: {
        async login() {
            this.error = false
            this.errors = {}
            if (!this.email) this.errors.email = 'fill in this field'
            if (!this.password) this.errors.password = 'fill in this field'
            if (Object.keys(this.errors).length) return

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
