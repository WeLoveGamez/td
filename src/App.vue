<template>
    <router-view />
</template>

<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #ffffff;
}

#nav {
    padding: 10px;
    margin-bottom: 5px;
    border-bottom: 1px solid black;
    a {
        font-weight: bold;
        color: #ffffff;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}
</style>
