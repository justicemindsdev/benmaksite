<script>
    import Navbar from "$lib/Navbar.svelte";
    import LoadingScreen from "$lib/LoadingScreen.svelte";
</script>

<LoadingScreen />
<Navbar />
<section class="text-gray-400 bg-gray-950 body-font border m-2 border-gray-700 rounded-xl">
    <div class="container mx-auto flex px-5 py-10 md:flex-row flex-col items-center">
      <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 md:mb-0 mb-10">
        <img class="object-cover object-center h-[500px] w-full rounded-xl" alt="hero" src="/Profiles/Ben.png">
      </div>
      <div class="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
        <h1 class="title-font sm:text-6xl text-2xl mb-4 font-thin text-white">Serving Justice with
          <br class="hidden lg:inline-block">Authority & Excellence
        </h1>
        <p class="mb-8 leading-relaxed">Copper mug try-hard pitchfork pour-over freegan heirloom neutra air plant cold-pressed tacos poke beard tote bag. Heirloom echo park mlkshk tote bag selvage hot chicken authentic tumeric truffaut hexagon try-hard chambray.</p>
        <div class="flex justify-center">
          <button class="inline-flex text-white bg-yellow-500 border-0 py-2 px-6 focus:outline-none hover:bg-yellow-600 rounded text-lg">Button</button>
          <button class="ml-4 inline-flex text-gray-400 bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">Button</button>
        </div>
      </div>
    </div>
  </section>

