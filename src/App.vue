<template>
  <router-view class="router-view" />
</template>

<style lang="scss">

.router-view {
  height: calc(100vh - 30px);
  transform: translateY(15px);
  box-shadow: 5px 5px 10px rgb(197, 197, 197);
  border-radius: 2px;
  background-color: white;
}

body {
  background-color: whitesmoke;
}

* {
  margin: 0px;
  padding: 0px;
  user-select: none;
}

#app {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif !important;
  // font-size: 24px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

</style>
