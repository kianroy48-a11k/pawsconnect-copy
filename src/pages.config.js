import Adoption from './pages/Adoption';
import Challenges from './pages/Challenges';
import CreatePost from './pages/CreatePost';
import Explore from './pages/Explore';
import LostFound from './pages/LostFound';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Services from './pages/Services';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Adoption": Adoption,
    "Challenges": Challenges,
    "CreatePost": CreatePost,
    "Explore": Explore,
    "LostFound": LostFound,
    "Messages": Messages,
    "Profile": Profile,
    "Services": Services,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};