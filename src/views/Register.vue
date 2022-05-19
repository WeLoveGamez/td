<template>
    <div class="container d-flex align-items-stretch justify-content-center flex-column" style="height: 100vh">
        <div class="card card-default w-75" style="margin-left: 12.5%">
            <div class="card-header header text-light">Sign up</div>
            <div class="card-body">
                <form @submit.prevent="register()" autocomplete="off">
                    <div class="m-4 alert alert-danger text-center" v-if="error">{{ error }}</div>
                    <div class="p-4 row col-12">
                        <div class="col-6 offset-3">
                            <SexyInput type="text" placeholder="username" :label-border="true" v-model="username" :error="errors.username"></SexyInput>
                        </div>
                    </div>
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
                    <div class="p-4 row col-12">
                        <div class="col-6 offset-3">
                            <SexyInput type="password" placeholder="confirm" :label-border="true" v-model="confirmed" minlength="6" :error="errors.confirmed"></SexyInput>
                        </div>
                    </div>
                    <button class="btn btn-success m-4 col-2 text-light" type="submit" v-if="!registering">Sign up</button>
                    <span v-if="registering" class="m-4 spinner-border spinner-border-sm text-primary"></span>
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
            confirmed: '',
            password: '',
            email: '',
            username: '',
            error: '',
            errors: {} as any,
            registering: false,
        }
    },
    methods: {
        async register() {
            this.errors = {}
            this.error = ''
            if (this.confirmed !== this.password) {
                this.errors.password = 'The passwords do not match'
                this.errors.confirmed = 'The passwords do not match'
            }
            if (!this.username) this.errors.username = 'fill in this field'
            if (!this.email) this.errors.email = 'fill in this field'
            if (!this.password) this.errors.password = 'fill in this field'
            if (!this.confirmed) this.errors.confirmed = 'fill in this field'
            if (Object.keys(this.errors).length) {
                this.error = 'Sorry, the account could not be registered'
                return
            }
            this.registering = true
            try {
                await API.register(this.username, this.email, this.password)
                this.$router.push('/game')
            } catch (e) {
                console.log("couldn't register", e)
                this.error = 'Sorry, the account could not be registered'
            } finally {
                this.registering = false
            }
        },
    },
})
</script>
<style lang="scss" scoped>
* {
    color: black;
}
</style>
