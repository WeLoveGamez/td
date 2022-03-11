<template>
    <div id="game">
        <div class="d-flex align-items-center" style="height: 100vh">
            <div class="row col-12 d-flex align-items-center justify-content-around">
                <div class="col-3 button p-0" @click="openBuilder()">
                    <div>MapBuilder</div>
                </div>
                <div class="col-3 button p-0" @click="openGame()">
                    <div>Game</div>
                </div>
                <div class="col-3 button p-0" @click="openStats()">
                    <div>Statistics</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    data() {
        return {}
    },
    methods: {
        openBuilder() {
            this.$router.push('/Mapbuilder')
        },
        openGame() {
            this.$router.push('/Game')
        },
        openStats() {
            this.$router.push('/Stats')
        },
    },
})
</script>

<style lang="scss">
.cardOption {
    color: black !important;
    background-color: white !important;
    :hover {
        color: white !important;
        background-color: black !important;
    }
}
</style>
