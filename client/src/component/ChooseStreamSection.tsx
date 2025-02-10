import { FaYoutube } from "react-icons/fa6";
import { RiSoundcloudFill } from "react-icons/ri";

function ChooseStreamSection() {
  const platforms = [
    {
      title: "Youtube",
      icon: <FaYoutube size={70} color="#FE0032" />,
    },
    {
      title: "SoundCloud",
      icon: <RiSoundcloudFill size={70} color="#FD6F00" />,
    },
  ];

  return (
    <div className="dark:bg-background_dark_secondary bg-background_light_secondary rounded-md  col-span-1 lg:col-span-2 p-4 flex flex-col gap-10">
      <h1 className="dark:text-white text-text_light text-xl sm:text-2xl font-semibold text-center max-h-[400px]">
        Choose a platform to start the stream
      </h1>
      <div className=" gap-4 grid grid-cols-2 md:grid-cols-3">
        {platforms.map((platform) => (
          <div
            key={platform.title}
            className="cursor-pointer dark:bg-background_dark bg-background_light h-auto rounded-md p-2 hover:scale-105 transition-all duration-300 text-center flex flex-col items-center justify-around dark:text-white text-text_light"
          >
            <h3>{platform.title}</h3>
            {platform.icon}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChooseStreamSection;
