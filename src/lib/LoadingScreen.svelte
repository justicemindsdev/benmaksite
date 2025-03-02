<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    
    let visible = true;
    
    onMount(() => {
        setTimeout(() => {
            visible = false;
        }, 2000);
    });
</script>

{#if visible}
    <div 
        transition:fade={{duration: 500}}
        class="fixed inset-0 bg-black z-50 flex flex-col text-gray-500 items-center justify-center"
    >
        <div class="animate-pulse">
            <img src="/logo.png" alt="Logo" class="w-1/4 mx-auto object-contain" />
        </div>
        <h3 class="text-3xl text-gray-400 font-thin">Official Government Portal</h3>
        <p class="text-gray-600">Authenticity Excellence Integrity</p>
    </div>
{/if}

<style>
    :global(body) {
        margin: 0;
        overflow-x: hidden;
    }
</style> 