<template lang="">
    <header class="py-4 md:py-10 bg-gray-800 pb-16">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-start md:justify-end space-y-2 md:space-x-5">
            <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Functions Invoker</h1>
        </div>
    </header>
    <main class="container mx-auto -mt-16 px-4 h-screen block mb-96">
        <div id="grid" class="mt-4 sm:mt-8 lg:mt-10 space-y-4">
            <div id="scores" class="card w-full pt-1">
                <h2 class="mt-4 mb-4">Functions</h2>
                <div class="top-16 flex flex-row gap-x-2">
                    <Listbox v-model="supaFunction" class="w-full">
                        <div class="relative">
                            <ListboxButton
                                class="relative w-full cursor-default rounded-lg bg-gray-800 font-mono text-white py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 text-sm sm:text-sm"
                                >
                                <span class="block truncate">{{ supaFunction }}</span>
                                <span
                                    class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                                >
                                    <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                                </ListboxButton>

                                <transition
                                leave-active-class="transition duration-100 ease-in"
                                leave-from-class="opacity-100"
                                leave-to-class="opacity-0"
                                >
                                <ListboxOptions
                                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 font-mono text-white font-bold py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                >
                                    <ListboxOption
                                    v-slot="{ active, selected }"
                                    v-for="fx in functionsList"
                                    :key="fx"
                                    :value="fx"
                                    as="template"
                                    >
                                    <li
                                        :class="[
                                        active ? 'bg-gray-600 text-gray-50' : 'text-gray-50',
                                        'relative cursor-default select-none py-2 pl-10 pr-4',
                                        ]"
                                    >
                                        <span
                                        :class="[
                                            selected ? 'font-medium' : 'font-normal',
                                            'block truncate',
                                        ]"
                                        >{{ fx }}</span
                                        >
                                        <span
                                        v-if="selected"
                                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600"
                                        >
                                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    </li>
                                    </ListboxOption>
                                </ListboxOptions>
                            </transition>
                        </div>
                    </Listbox>
                    <!-- <Vue3JsonEditor
                        class="w-full"
                        v-model="requestJson"
                        :show-btns="false"
                        :expandedOnStart="true"    
                    /> -->
                    <!-- <vue-code-highlight language="json"> -->
                    <textarea class="bg-gray-800 text-gray-100 rounded-md px-4 py-4 w-full font-mono" v-model="stringyJson">
                    </textarea>
                    <!-- </vue-code-highlight> -->
                </div>
                <button className="button primary mt-2" @click="invokeFunction">
                        Invoke Function
                </button>
            </div>
            <code class="bg-gray-900 block rounded text-xs p-4 text-white block w-full"><pre>{{ output }}</pre></code>
        </div>
    </main>
</template>
<script>
import { useAuthStore } from '../stores/auth'
import { supabase } from "../supabase"
import { ref, reactive } from 'vue'
import {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from '@headlessui/vue'
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid'
import { Vue3JsonEditor } from 'vue3-json-editor'
import { component as VueCodeHighlight } from 'vue-code-highlight';


export default {
    setup() {
        const authStore = useAuthStore()
        const user = authStore.user

        return { user }
    },
    data() {
        return {
            output: '',
            supaFunction: 'init-game',
            stringyJson: `{ "name": "Ellen" }`,
            functionsList: ['init-game']
        }
    },
    components: {
        Listbox,
        ListboxLabel,
        ListboxButton,
        ListboxOptions,
        ListboxOption,
        CheckIcon,
        SelectorIcon,
        Vue3JsonEditor
    },
    computed: {
        requestJson() {
            return JSON.parse(this.stringyJson)
        }
    },
    methods: {
        setOutput(data) {
            this.output = data
        },
        async invokeFunction() {
            console.log('invoking function...', this.supaFunction, this.requestJson)

            const { data, error } = await supabase.functions.invoke(this.supaFunction, {
                body: JSON.stringify(this.requestJson),
            })
            if (error) alert(error)
            this.setOutput(data)
        }
    }
}
</script>
<style lang="">
    
</style>