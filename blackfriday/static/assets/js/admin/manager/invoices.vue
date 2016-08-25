<template>
    <form id="search">
    <div>Search <input name="query" v-model="name"></div>
    <div>Search <input name="query" v-model="power"></div>
    <div>Search <input name="status" value="" checked type="radio" v-model="status"></div>
    <div>Search <input name="status" value="true" type="radio" v-model="status"></div>
    <div>Search <input name="status" value="false" type="radio" v-model="status"></div>
    </form>
    <table>
      <tr v-for="tr in trs | filterBy name in 'name' | filterBy power in 'power'  | filterBy status in 'status'">
        <td v-for="td in tds">{{tr[td]}}</td>
      </tr>
    </table>
</template>

<script>
    export default {
        data() {
            return {
                tds: ['name', 'power', 'status'],
                trs: [
                  { name: 'Chuck Norris', power: Infinity, status: true },
                  { name: 'Bruce Lee', power: 9000, status: true },
                  { name: 'Jackie Chan', power: 7000, status: true },
                  { name: 'Jet Li', power: 8000, status: false }
                ]
            }
        }
    }
</script>
