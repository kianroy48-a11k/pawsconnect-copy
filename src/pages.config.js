import Adoption from './pages/Adoption';
import Challenges from './pages/Challenges';
import CreatePost from './pages/CreatePost';
import LostFound from './pages/LostFound';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Home from './pages/Home';
import Services from './pages/Services';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Adoption": Adoption,
    "Challenges": Challenges,
    "CreatePost": CreatePost,
    "LostFound": LostFound,
    "Messages": Messages,
    "Profile": Profile,
    "Explore": Explore,
    "Home": Home,
    "Services": Services,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};